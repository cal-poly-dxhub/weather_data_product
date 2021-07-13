export const reducer = (state, action) => {
    switch (action.type) {
        case "instruments/selector":
            return {
                ...state,
                instruments: {
                    ...state.instruments,
                    index: action.payload
                }
            }

        // PAYLOAD instruments/data
        // {
        //     key: '0,
        //     label: 'Wind'
        //     path: 'mini-sodar',
        //     data: []
        // }

        case "instruments/data":
            return {
                ...state,
                instruments: {
                    ...state.instruments,
                    options: [
                        ...state.instruments.options.slice(0, action.payload.key),
                        { key: action.payload.key,
                          label: state.instruments.options[action.payload.key].label,
                          variants: state.instruments.options[action.payload.key].variants.map((variant) => {
                              return(
                                  variant.path === action.payload.path
                                    ? { path: variant.path,
                                        data: action.payload.data }
                                    : variant
                              )
                          })
                        }
                    ]
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
        index: 1,
        options: [
            { key: 0, label: 'Sodar', variants: [
                { path: 'mini-sodar/',
                  label: 'Wind & Gust',
                  data: []
                },
            ]},

            { key: 1, label: 'Profiler', variants: [
                { path: '915-profiler/temp/',
                  label: 'Temperature',
                  data: []
                },
                { path: '915-profiler/wind/',
                  label: 'Wind',
                  data: []
                },
            ]},

            { key: 2, label: 'Tower', variants: [
                { path: 'tower/',
                  label: 'Unknown',
                  data: []
                },
            ]},

            { key: 3, label: 'ASOS', variants: [
                { path: 'asos/',
                  label: 'Unknown',
                  data: []
                },
            ]},

            { key: 4, label: 'AMPS', variants: [
                { path: 'amps/',
                  label: 'Unknown',
                  data: []
                },
            ]},
        ]
    },
    settings: {
        temp_imperial: true,
        distance_imperial: true
    }
}