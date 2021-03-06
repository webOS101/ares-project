enyo.singleton({
	name: "Model",
	kind: "enyo.Component",
	debug: false,
	info: {},
	config: [],
	defaults: null,				// populated by base-design.js

	F_HIDDEN: -1,
	F_DANGEROUS: 1,
	F_NORMAL: 2,
	F_USEFUL: 3,

	levelMapping: null,			// Instanciated at create() time
	create: function() {
		this.inherited(arguments);
		//
		this.levelMapping = {
			"hidden": this.F_HIDDEN,
			"dangerous": this.F_DANGEROUS,
			"normal": this.F_NORMAL,
			"useful": this.F_USEFUL
		};
	},
	/**
	 * Build all the information needed by the inspector
	 * @public
	 */
	buildInformation: function() {
		this.palette = Palette.model,		// TODO: Should replace Palette.model
		this.addInformation("properties", "__default", this.defaults.properties);
		this.addInformation("events", "__default", this.defaults.events);

		enyo.forEach(this.config, function(item) {
			if (item.type === "kind") {
				this.debug && this.log("Processing: " + item.name, item);
				this.addInformation("properties", item.name, item.properties);
				this.addInformation("events", item.name, item.events);
			} else {
				enyo.error("Unknown data type='" + item.type + "' -- Ignored");
			}
		}, this);
	},
	addInformation: function(inType, inName, inInfo) {
		if (inInfo) {
			this.debug && this.log("Adding " + inType + " information for " + inName);

			var fn = function(inType, inName, inSubName, inData) {
				if (inData.filterLevel) {
					inData.level = Model.levelMapping[inData.filterLevel];
					if ( ! inData.level) {
						inData.level = Model.F_NORMAL;
						enyo.error("Invalid filter level for " + inType + " " + inName + "." + inSubName);
					}
				} else {
					inData.level = Model.F_NORMAL;
				}
				this.debug && this.log("Setting level " + inData.level + " for " + inType + " " + inName + "." + inSubName);
			};
			var addFilterLevel = enyo.bind(this, fn, inType, inName);

			if ( ! this.info[inName]) {
				this.info[inName] = {};
			}
			this.info[inName][inType] = inInfo;

			var keys = Object.keys(inInfo);
			for (var n = 0; n < keys.length; n++) {
				addFilterLevel(keys[n], inInfo[keys[n]]);
			}
		}
	},
	getInfo: function(inKind, inType, inName) {
		try {
			return this.info[inKind][inType][inName];
		} catch(error) {
			return;		// Return undefined
		}
	},
	getFilterLevel: function(inKind, inType, inName) {
		var info;
		try {
			info = this.getInfo(inKind, inType, inName);
			if (info && info.level) {
				return info.level;
			} else {
				return this.getInfo("__default", inType, inName).level || Model.F_NORMAL;
			}
		} catch(error) {
			info = this.getInfo("__default", inType, inName);
			return (info && info.level) || Model.F_NORMAL;
		}
	}
});
