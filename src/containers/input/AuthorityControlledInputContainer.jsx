import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { components as inputComponents } from 'cspace-input';
import warning from 'warning';
import parseAuthoritySpec from '../../helpers/parseAuthoritySpec';

import {
  addTerm,
  findMatchingTerms,
  clearMatchedTerms,
} from '../../actions/partialTermSearch';

import withRecordPlugins from '../../enhancers/withRecordPlugins';
import { getPartialTermSearchMatches } from '../../reducers';

const { AuthorityControlledInput } = inputComponents;

const messages = defineMessages({
  count: {
    id: 'authorityControlledInput.count',
    description: 'Message displayed in the authority controlled input dropdown when filtering options.',
    defaultMessage: `{count, plural,
        =0 {No matching terms}
        one {# matching term}
        other {# matching terms}
    } found`,
  },
  moreCharsRequired: {
    id: 'authorityControlledInput.moreCharsRequired',
    description: 'Message displayed in the authority controlled input dropdown when more characters must be typed in order to begin matching.',
    defaultMessage: 'Continue typing to find matching terms',
  },
});

const mapStateToProps = (state, ownProps) => {
  const {
    intl,
    recordPlugins,
  } = ownProps;

  return {
    formatMoreCharsRequiredMessage: () => intl.formatMessage(messages.moreCharsRequired),
    formatSearchResultMessage: count => intl.formatMessage(messages.count, { count }),
    formatVocabName: vocab => intl.formatMessage(vocab.messageDescriptors.vocabNameTitle),
    matches: getPartialTermSearchMatches(state),
    recordTypes: recordPlugins,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    authority,
    recordPlugins,
  } = ownProps;

  const authorities = parseAuthoritySpec(authority);

  return {
    addTerm: (authorityName, vocabularyName, displayName) => {
      const recordType = recordPlugins[authorityName];

      warning(recordType, `The authority record type '${authorityName}' is not configured. Check the authority prop of the input with name '${ownProps.name}'.`);

      if (recordType) {
        const serviceConfig = recordType.serviceConfig;

        if (
          serviceConfig &&
          serviceConfig.vocabularies &&
          serviceConfig.vocabularies[vocabularyName]
        ) {
          dispatch(addTerm(serviceConfig, vocabularyName, displayName));
        }
      }
    },
    findMatchingTerms: (partialTerm) => {
      authorities.forEach((authoritySpec) => {
        const {
          authorityName,
          vocabularyName,
        } = authoritySpec;

        const recordType = recordPlugins[authorityName];

        warning(recordType, `The authority record type '${authorityName}' is not configured. Check the authority prop of the input with name '${ownProps.name}'.`);

        if (recordType) {
          const serviceConfig = recordType.serviceConfig;

          if (
            serviceConfig &&
            serviceConfig.vocabularies &&
            serviceConfig.vocabularies[vocabularyName]
          ) {
            dispatch(findMatchingTerms(serviceConfig, vocabularyName, partialTerm));
          }
        }
      });
    },
    onClose: () => {
      dispatch(clearMatchedTerms());
    },
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    /* eslint-disable no-unused-vars */
    intl,
    recordPlugins,
    /* eslint-enable no-unused-vars */
    ...remainingOwnProps
  } = ownProps;

  return {
    ...remainingOwnProps,
    ...stateProps,
    ...dispatchProps,
  };
};


export const ConnectedAuthorityControlledInput = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(AuthorityControlledInput);

const IntlAwareConnectedAuthorityControlledInput =
  injectIntl(withRecordPlugins(ConnectedAuthorityControlledInput));

IntlAwareConnectedAuthorityControlledInput.propTypes = {
  ...AuthorityControlledInput.propTypes,
  authority: PropTypes.string.isRequired,
  recordPlugins: PropTypes.object,
};

export default IntlAwareConnectedAuthorityControlledInput;
