export const reducer = (state, action) => {
    switch (action.type) {
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

        // PAYLOAD exports/delete
        //     instrument:  'mini-sodar',
        //     category:    '',
        //     assetID:     '522',
        //     from:        '2017-05-24T10:30',
        //     to:          '2017-05-25T11:30'

        // case "exports/delete":
        //     return {
        //         ...state,
        //         exports: [
        //             ...state.exports,
        //             action.payload
        //         ]
        //     }
    
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