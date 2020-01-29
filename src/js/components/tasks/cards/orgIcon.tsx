import Button from '@salesforce/design-system-react/components/button';
import Icon from '@salesforce/design-system-react/components/icon';
import i18n from 'i18next';
import React from 'react';

import { ExternalLink } from '@/components/utils';

const OrgIcon = ({
  orgId,
  ownedByCurrentUser,
  isDeleting,
  isSynced,
  openRefreshOrgModal,
}: {
  orgId: string;
  ownedByCurrentUser: boolean;
  isDeleting: boolean;
  isSynced?: boolean;
  openRefreshOrgModal: () => void;
}) => {
  const orgUrl = window.api_urls.scratch_org_redirect(orgId);

  if (orgUrl && ownedByCurrentUser && !isDeleting) {
    const iconLink = (
      <Icon
        category="utility"
        name="link"
        size="x-small"
        className="icon-link slds-m-bottom_xxx-small"
      />
    );
    const viewOrgLink = isSynced ? (
      <ExternalLink url={orgUrl} title={i18n.t('View Org')}>
        {iconLink}
      </ExternalLink>
    ) : (
      <Button
        variant="icon"
        iconName="link"
        iconSize="x-small"
        iconVariant="bare"
        assistiveText={{ label: i18n.t('View Org') }}
        onClick={openRefreshOrgModal}
      >
        {iconLink}
      </Button>
    );
    return viewOrgLink;
  }

  return (
    <Icon
      category="utility"
      name="link"
      size="x-small"
      className="slds-m-bottom_xxx-small"
    />
  );
};

export default OrgIcon;
