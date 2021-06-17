export const reducer = (state, action) => {
    switch (action.type) {
        case "instrument/selector":
            return {
                ...state,
                instruments: {
                    ...state.instruments,
                    index: action.payload
                }
            }
        case "settings/temp_imperial":
            return {
                ...state,
                settings: {
                    ...state.settings,
                    temp_imperial: action.payload
                }
            }

        case "settings/distance_imperial":
            return {
                ...state,
                settings: {
                    ...state.settings,
                    distance_imperial: action.payload
                }
            }

        default:
            return state
    }
}

export const initialState = {
    instruments: {
        index: 0,
        options: [
            { key: 0, label: 'Tower' },
            { key: 1, label: 'Profiler' },
            { key: 2, label: 'Sodar' },
            { key: 3, label: 'AMPS' },
            { key: 4, label: 'FBWOS' }
        ]
    },
    settings: {
        temp_imperial: true,
        distance_imperial: true
    }
}