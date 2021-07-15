import C from '../../actions/constants';

const initialState = {
    result: { sourceLanguage: [], targetLanguage:[], datasetType: [], domains: [], collectionMethod_collectionDescriptions: [] }
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case C.GET_DATASET_ITEMS:
            return {
                result: action.payload.data
            }
        default:
            return {
                ...state
            }
    }
}

export default reducer;