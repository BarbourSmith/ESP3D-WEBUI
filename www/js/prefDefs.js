/** Definitions for all the preferences */
export const prefDefs = {
    "language_list": {
        "defValue": "en",
        "valueType": "select",
        "fieldId": "language_preferences",
        "label": "language",
    },

    "enable_lock_UI": { "defValue": false, "valueType": "bool", "label": "Enable lock interface" },
    "enable_ping": { "defValue": true, "valueType": "bool", "label": "Connection monitoring" },
    "enable_DHT": { "defValue": false, "valueType": "bool", "label": "Show DHT output" },

    "enable_camera": {
        "defValue": false,
        "valueType": "panel",
        "panel": "camera_preferences",
        "fieldId": "show_camera_panel",
        "label": "Show camera panel",
        "prefDefs": {
            "auto_load_camera": { "defValue": false, "valueType": "bool", "label": "Auto load camera" },
            "camera_address": {
                "defValue": "",
                "valueType": "enctext",
                "label": "Camera address",
                "placeholder": "Camera address",
                "inpClass": "w14",
            },
        },
    },
    "enable_control_panel": {
        "defValue": true,
        "valueType": "panel",
        "panel": "control_preferences",
        "fieldId": "show_control_panel",
        "label": "Show control panel",
        "prefDefs": {
            "interval_positions": {
                "defValue": 3,
                "valueType": "int",
                "units": "sec",
                "label": "Position Refresh Time",
                "inpClass": "w4",
                "min": 1,
                "max": 99
            },
            "xy_feedrate": {
                "defValue": 2500,
                "valueType": "float",
                "units": "mm/min",
                "label": "XY axis feedrate",
                "inpClass": "w8",
                "min": 0.00001
            },
            "z_feedrate": {
                "defValue": 300,
                "valueType": "float",
                "units": "mm/min",
                "label": "Z axis feedrate",
                "inpClass": "w8",
                "min": 0.00001
            },
            "a_feedrate": {
                "defValue": 100,
                "valueType": "float",
                "units": "mm/min",
                "label": "A axis feedrate",
                "inpClass": "w6",
                "min": 0.00001
            },
            "b_feedrate": {
                "defValue": 100,
                "valueType": "float",
                "units": "mm/min",
                "label": "B axis feedrate",
                "inpClass": "w6",
                "min": 0.00001
            },
            "c_feedrate": {
                "defValue": 100,
                "valueType": "float",
                "units": "mm/min",
                "label": "C axis feedrate",
                "inpClass": "w6",
                "min": 0.00001
            },
        },
    },

    "enable_grbl_panel": {
        "defValue": false,
        "valueType": "panel",
        "panel": "grbl_preferences",
        "fieldId": "show_grbl_panel",
        "label": "Show GRBL panel",
        "prefDefs": {
            "autoreport_interval": {
                "defValue": 50,
                "valueType": "int",
                "units": "ms",
                "label": "AutoReport Interval",
                "inpClass": "w6",
                "min": 0,
                "max": 30000,
            },
            "interval_status": {
                "defValue": 3,
                "valueType": "int",
                "units": "sec",
                "label": "Status Refresh Time",
                "inpClass": "w4",
                "min": 0,
                "max": 99
            },
            "enable_grbl_probe_panel": {
                "defValue": false,
                "valueType": "panel",
                "panel": "grblprobetablink",
                "fieldId": "show_grbl_probe_tab",
                "label": "Show probe panel",
                "prefDefs": {
                    "probemaxtravel": {
                        "defValue": 40,
                        "valueType": "float",
                        "units": "mm",
                        "label": "Max travel",
                        "inpClass": "w8",
                        "min": 0.00001,
                        "max": 9999
                    },
                    "probefeedrate": {
                        "defValue": 100,
                        "valueType": "float",
                        "units": "mm/min",
                        "label": "Feed rate",
                        "inpClass": "w8",
                        "min": 0.00001,
                        "max": 9999
                    },
                    "probetouchplatethickness": {
                        "defValue": 0.5,
                        "valueType": "float",
                        "units": "mm",
                        "label": "Touch plate thickness",
                        "inpClass": "w8",
                        "min": 0,
                        "max": 9999
                    },
                    "proberetract": {
                        "defValue": 1.0,
                        "valueType": "float",
                        "units": "mm",
                        "label": "Retract distance",
                        "inpClass": "w8",
                        "min": 0,
                        "max": 9999
                    },
                }
            }
        }
    },

    "enable_files_panel": {
        "defValue": true,
        "valueType": "panel",
        "panel": "files_preferences",
        "fieldId": "show_files_panel",
        "label": "Show files panel",
        "prefDefs": {
            "has_TFT_SD": { "defValue": false, "valueType": "bool", "label": "TFT SD card" },
            "has_TFT_USB": { "defValue": false, "valueType": "bool", "label": "TFT USB disk" },
            "f_filters": {
                "defValue": ".g;.gc;.gco;.gcode;.nc;.txt;.G;.GC;.GCO;.GCODE;.NC;.TXT",
                "valueType": "text",
                "label": "File extensions (use ; to separate)",
                "inpClass": "w25",
            },
        },
    },

    "enable_commands_panel": {
        "defValue": true,
        "valueType": "panel",
        "panel": "cmd_preferences",
        "fieldId": "show_commands_panel",
        "label": "Show commands panel",
        "prefDefs": {
            "enable_autoscroll": { "defValue": true, "valueType": "bool", "label": "Autoscroll" },
            "enable_verbose_mode": { "defValue": true, "valueType": "bool", "label": "Verbose mode" },
        },
    },
};
