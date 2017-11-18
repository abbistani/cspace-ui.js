export default pluginContext => (data) => {
  const {
    deepGet,
    getPart,
  } = pluginContext.recordDataHelpers;

  if (!data) {
    return '';
  }

  const common = getPart(data, 'collectionobjects_common');

  if (!common) {
    return '';
  }

  const objectNumber = common.get('objectNumber');
  const title = deepGet(common, ['titleGroupList', 'titleGroup', 0, 'title']);

  return [objectNumber, title].filter(part => !!part).join(' – ');
};
