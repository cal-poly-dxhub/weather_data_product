export const reducer = (state, action) => {
    switch (action.type) {
        // PAYLOAD instruments/codes
        //      key:     'tower',
        //      codes:    [...]

        case "instruments/codes":
            if (state.instruments[action.payload.key] != null && state.instruments[action.payload.key].codes != null) {
                return {
                    ...state,
                    instruments: {
                        ...state.instruments,
                        [action.payload.key]: {
                            ...state.instruments[action.payload.key],
                            codes: action.payload.codes
                        }
                    }
                }
            } else {
                console.log("Tried to store codes to reducer, but instrument either does not need them or does not exist.")
            }

            break;

        // PAYLOAD instruments/data
        //      key:     'profiler_temp',
        //      data:    [...]

        case "instruments/data":
            const keys = action.payload.key.split("/").filter(key => key)

            if (keys.length == 2) {
                return {
                    ...state,
                    instruments: {
                        ...state.instruments,
                        [keys[0]]: {
                            ...state.instruments[keys[0]],
                            [keys[1]]: {
                                ...state.instruments[keys[0]][keys[1]],
                                data: action.payload.data
                            }
                        }
                    }
                }
            } else if (keys.length == 1) {
                return {
                    ...state,
                    instruments: {
                        ...state.instruments,
                        [keys[0]]: {
                            ...state.instruments[keys[0]],
                            data: action.payload.data
                        }
                    }
                }
            } else {
                return state
            }

        // PAYLOAD exports/add
        //     instrument:  'mini-sodar',
        //     category:    '',
        //     assetID:     '522',
        //     location:    'LF06'
        //     from:        '2017-05-24T10:30',
        //     to:          '2017-05-25T11:30'

        case "exports/add":
            console.log(action.payload)
            return {
                ...state,
                exports: [
                    ...state.exports,
                    action.payload
                ]    
            }

        case "settings/imperial":
            return {
                ...state,
                settings: {
                    ...state.settings,
                    imperial: action.payload
                }
            }

        default:
            return state
    }
}

export const initialState = {
    instruments: {
        sodar: {
            path: "mini-sodar/",
            data: []
        },
        profiler: {
            path: "915-profiler/",
            temp: {
                path: "temp/",
                data: []
            },
            wind: {
                path: "wind/",
                data: []
            }
        },
        tower: {
            path: "tower/",
            codes: [],
            data: []
        },
        asos: {
            path: "asos/",
            data: []
        },
        amps: {
            path: "amps/",
            data: []
        },
    },

    exports: [],

    settings: {
        imperial: true
    }
}