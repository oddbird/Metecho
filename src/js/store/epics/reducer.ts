import { ObjectsAction, PaginatedObjectResponse } from '@/store/actions';
import { EpicAction } from '@/store/epics/actions';
import { LogoutAction, RefetchDataAction } from '@/store/user/actions';
import { GitHubUser } from '@/store/user/reducer';
import { EpicStatuses, OBJECT_TYPES, ObjectTypes } from '@/utils/constants';

export interface OrgConfig {
  key: string;
  label?: string;
  description?: string;
}

export interface Epic {
  id: string;
  repository: string;
  name: string;
  slug: string;
  old_slugs: string[];
  description: string;
  description_rendered: string;
  branch_name: string;
  branch_url: string | null;
  branch_diff_url: string | null;
  pr_url: string | null;
  pr_is_open: boolean;
  pr_is_merged: boolean;
  has_unmerged_commits: boolean;
  currently_creating_pr: boolean;
  currently_fetching_org_config_names: boolean;
  github_users: GitHubUser[];
  status: EpicStatuses;
  available_task_org_config_names: OrgConfig[];
}

export interface EpicsByRepositoryState {
  epics: Epic[];
  next: string | null;
  notFound: string[];
  fetched: boolean;
}

export interface EpicsState {
  [key: string]: EpicsByRepositoryState;
}

const defaultState = {
  epics: [],
  next: null,
  notFound: [],
  fetched: false,
};

const modelIsEpic = (model: any): model is Epic =>
  Boolean((model as Epic).repository);

const reducer = (
  epics: EpicsState = {},
  action: EpicAction | ObjectsAction | LogoutAction | RefetchDataAction,
) => {
  switch (action.type) {
    case 'REFETCH_DATA_SUCCEEDED':
    case 'USER_LOGGED_OUT':
      return {};
    case 'FETCH_OBJECTS_SUCCEEDED': {
      const {
        response,
        objectType,
        reset,
        filters: { repository },
      } = action.payload;
      const { results, next } = response as PaginatedObjectResponse;
      if (objectType === OBJECT_TYPES.EPIC && repository) {
        const repositoryEpics = epics[repository] || { ...defaultState };
        if (reset) {
          return {
            ...epics,
            [repository]: {
              ...repositoryEpics,
              epics: results,
              next,
              fetched: true,
            },
          };
        }
        // Store list of known epic IDs to filter out duplicates
        const ids = repositoryEpics.epics.map((p) => p.id);
        return {
          ...epics,
          [repository]: {
            ...repositoryEpics,
            epics: [
              ...repositoryEpics.epics,
              ...results.filter((p) => !ids.includes(p.id)),
            ],
            next,
            fetched: true,
          },
        };
      }
      return epics;
    }
    case 'CREATE_OBJECT_SUCCEEDED': {
      const {
        object,
        objectType,
      }: { object: Epic; objectType?: ObjectTypes } = action.payload;
      if (objectType === OBJECT_TYPES.EPIC && object) {
        const repository = epics[object.repository] || { ...defaultState };
        // Do not store if (somehow) we already know about this epic
        if (!repository.epics.filter((p) => object.id === p.id).length) {
          return {
            ...epics,
            [object.repository]: {
              ...repository,
              // Prepend new epic (epics are ordered by `-created_at`)
              epics: [object, ...repository.epics],
            },
          };
        }
      }
      return epics;
    }
    case 'FETCH_OBJECT_SUCCEEDED': {
      const {
        object,
        filters: { repository, slug },
        objectType,
      } = action.payload;
      if (objectType === OBJECT_TYPES.EPIC && repository) {
        const repositoryEpics = epics[repository] || { ...defaultState };
        if (!object) {
          return {
            ...epics,
            [repository]: {
              ...repositoryEpics,
              notFound: [...repositoryEpics.notFound, slug],
            },
          };
        }
        // Do not store if we already know about this epic
        if (!repositoryEpics.epics.filter((p) => object.id === p.id).length) {
          return {
            ...epics,
            [object.repository]: {
              ...repositoryEpics,
              epics: [...repositoryEpics.epics, object],
            },
          };
        }
      }
      return epics;
    }
    case 'EPIC_UPDATE':
    case 'UPDATE_OBJECT_SUCCEEDED': {
      let maybeEpic;
      if (action.type === 'EPIC_UPDATE') {
        maybeEpic = action.payload;
      } else {
        const {
          object,
          objectType,
        }: { object: Epic; objectType?: ObjectTypes } = action.payload;
        if (objectType === OBJECT_TYPES.EPIC && object) {
          maybeEpic = object;
        }
      }
      /* istanbul ignore if */
      if (!maybeEpic) {
        return epics;
      }
      const epic = maybeEpic;
      const repositoryEpics = epics[epic.repository] || {
        ...defaultState,
      };
      const existingEpic = repositoryEpics.epics.find((p) => p.id === epic.id);
      if (existingEpic) {
        return {
          ...epics,
          [epic.repository]: {
            ...repositoryEpics,
            epics: repositoryEpics.epics.map((p) => {
              if (p.id === epic.id) {
                return { ...epic };
              }
              return p;
            }),
          },
        };
      }
      return {
        ...epics,
        [epic.repository]: {
          ...repositoryEpics,
          epics: [...repositoryEpics.epics, epic],
        },
      };
    }
    case 'EPIC_CREATE_PR_FAILED': {
      const epic = action.payload;
      const repositoryEpics = epics[epic.repository] || {
        ...defaultState,
      };
      const existingEpic = repositoryEpics.epics.find((p) => p.id === epic.id);
      if (existingEpic) {
        return {
          ...epics,
          [epic.repository]: {
            ...repositoryEpics,
            epics: repositoryEpics.epics.map((p) => {
              if (p.id === epic.id) {
                return { ...epic, currently_creating_pr: false };
              }
              return p;
            }),
          },
        };
      }
      return epics;
    }
    case 'OBJECT_REMOVED':
    case 'DELETE_OBJECT_SUCCEEDED': {
      let maybeEpic;
      if (action.type === 'OBJECT_REMOVED') {
        maybeEpic = modelIsEpic(action.payload) ? action.payload : null;
      } else {
        const {
          object,
          objectType,
        }: { object: Epic; objectType?: ObjectTypes } = action.payload;
        if (objectType === OBJECT_TYPES.EPIC && object) {
          maybeEpic = object;
        }
      }
      /* istanbul ignore if */
      if (!maybeEpic) {
        return epics;
      }
      const epic = maybeEpic;
      /* istanbul ignore next */
      const repositoryEpics = epics[epic.repository] || {
        ...defaultState,
      };
      return {
        ...epics,
        [epic.repository]: {
          ...repositoryEpics,
          epics: repositoryEpics.epics.filter((p) => p.id !== epic.id),
        },
      };
    }
  }
  return epics;
};

export default reducer;
