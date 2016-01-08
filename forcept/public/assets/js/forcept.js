/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug() {
	var compile = ""
	for(var i = 0; i < arguments.length; i++) {
		var data = arguments[i];
		if(typeof data == "object" && data !== null) {
			data = JSON.stringify(data, null, "  ");
		}
		compile += (data + "<br/><br/>");
	}
	$("#forcept-debug-content pre").html(compile);
}

function isTrue(statement) {
	switch(typeof statement) {
		case "boolean":
			return statement == true;
			break;
		case "string":
			return statement === "true";
			break;
		default:
			return false;
			break;
	}
}

function base64bytes(string) {
	var splitHeadAndData = string.split(',');
	return Math.round( (splitHeadAndData[1].length - splitHeadAndData[0].length) * 0.75 );
}

/* ========================================= */

var Fields = {
	labelColumnClasses: "col-lg-4 col-sm-5 col-xs-12",
	inputColumnClasses: "col-lg-8 col-sm-7 col-xs-12"
};

Fields.FieldLabel = React.createClass({displayName: "FieldLabel",
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				React.createElement("div", null, React.createElement("small", null, this.props.description))
			);
		}
		return (
			React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, 
				this.props.name, 
				description
			)
		)
	}
})

Fields.Text = React.createClass({displayName: "Text",
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "text", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextInputChange})
				)
			)
		);
	}
});

Fields.Textarea = React.createClass({displayName: "Textarea",
	onTextareaInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("textarea", {
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextareaInputChange})
				)
			)
		);
	}
});

Fields.Number = React.createClass({displayName: "Number",
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "number", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onNumberInputChange})
				)
			)
		);
	}
});

Fields.Date = React.createClass({displayName: "Date",
	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "date", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onDateInputChange})
				)
			)
		);
	}
});

Fields.Select = React.createClass({displayName: "Select",

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false,
		};
	},

	onSelectInputChange: function(event) {

		// Check value before bubbling.
		switch(event.target.value) {
			case "__default__":
				// Spoof event target value
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, "");
				break;
			case "__custom__":
				// Set top-level state value to nothing (so it says "No data")
				this.setState({ isCustomDataOptionSelected: true });
				this.props.onChange(this.props.id, "");
				break;
			default:
				// Bubble event up to handler passed from Visit
				// (pass field ID and event)
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, event.target.value);
				break;
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var options,
			displaySelect;

		// Default option (prepended to select)
		var defaultOption = (
			React.createElement("option", {value: "__default__", disabled: "disabled"}, "Choose an option…")
		);
		// Custom data option (appended to select IF allowCustomData is set)
		var customDataOption = (
			React.createElement("option", {value: "__custom__"}, "Enter custom data for this field »")
		);

		// Custom data input 
		var customDataInput = (
			React.createElement("input", {type: "text", className: "form-control", placeholder: "Enter custom data here", onChange: this.onCustomDataInputChange})
		);

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					React.createElement("option", {value: option, key: this.props.id + "-option-" + index}, option)
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				React.createElement("select", {className: "form-control", onChange: this.onSelectInputChange, defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : "__default__"}, 
					defaultOption, 
					options, 
					isTrue(this.props.settings.allowCustomData) ? customDataOption : ""
				)
			);
		} else {
			displaySelect = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Warning:"), " no options defined for select input ", this.props.id
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect, 
					isTrue(this.state.isCustomDataOptionSelected) ? customDataInput : ""
				)
			)
		);
	}
});

Fields.MultiSelect = React.createClass({displayName: "MultiSelect",

	getInitialState: function() {
		return {};
	},

	onSelectInputChange: function(event) {
		var options = event.target.options;
		var values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}

		this.props.onChange(this.props.id, values);
	},

	render: function() {

		var options,
			displaySelect;

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					React.createElement("option", {value: option, key: this.props.id + "-option-" + index}, option)
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				React.createElement("select", {className: "form-control", onChange: this.onSelectInputChange, multiple: true, defaultValue: this.props.defaultValue}, 
					options
				)
			);
		} else {
			displaySelect = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Warning:"), " no options defined for select input ", this.props.id
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect
				)
			)
		);
	}
});

Fields.File = React.createClass({displayName: "File",
	getInitialState: function() {
		return {
			fileCount: 0,
			fileSize: 0,
		};
	},

	componentWillMount: function() {
		if(this.props.hasOwnProperty("defaultValue") && this.props.defaultValue !== null) {
			this.setState({
				fileCount: 1,
				fileSize: base64bytes(this.props.defaultValue)
			});
		}
	},

	onFileInputChange: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function(upload) {
			console.log("Reader onload return upload target result:");
			console.log(upload.target.result);
			this.setState({ 
				fileCount: 1, 
				fileSize: base64bytes(upload.target.result)
			});
			this.props.onChange(this.props.id, upload.target.result);
		}.bind(this);

		reader.readAsDataURL(file);
	},

	render: function() {
		var accept = "";
		if(this.props.settings.hasOwnProperty("accept")) {
			accept = this.props.settings.accept.join();
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("label", {className: "file"}, 
						React.createElement("input", {type: "file", className: "form-control", accept: accept, onChange: this.onFileInputChange}), 
						React.createElement("span", {className: "file-custom"}, this.state.fileCount == 0 ? "No files - " : this.state.fileCount + " file - " + (this.state.fileCount == 1 ? "" : "s"))
					), 
					React.createElement("h6", null, this.state.fileSize > 0 ? this.state.fileSize + " bytes" : "")
				)
			)
		);
	}
});

Fields.YesNo = React.createClass({displayName: "YesNo",

	getInitialState: function() {
		return {
			yes: null,
		};
	},

	componentWillMount: function() {
		// If data, set
		if(this.props.hasOwnProperty('defaultValue') 
			&& this.props.defaultValue !== null
			&& ["yes", "no"].indexOf(this.props.defaultValue.toLowerCase()) !== -1) {
			this.setState({
				yes: this.props.defaultValue.toLowerCase() == "yes"
			});
		}
	},

	onYesNoInputChange: function(status) {
		return function(evt) {
			console.log("Caught yes/no input change -> " + status);

			this.setState({
				yes: status
			});

			this.props.onChange(this.props.id, status ? "Yes" : "No");

		}.bind(this);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("div", {className: "btn-group btn-group-block", "data-toggle": "buttons"}, 
						React.createElement("label", {className: "btn btn-primary-outline" + (this.state.yes == true ? " active" : ""), onClick: this.onYesNoInputChange(true)}, 
							React.createElement("input", {type: "radio", 
								name: this.props.name + "-options", 
								autoComplete: "off", 
									
								defaultChecked: this.state.yes == true}), 
							"Yes"
						), 
						React.createElement("label", {className: "btn btn-primary-outline" + (this.state.yes == false ? " active" : ""), onClick: this.onYesNoInputChange(false)}, 
							React.createElement("input", {type: "radio", 
								name: this.props.name + "-options", 
								autoComplete: "off", 

								defaultChecked: this.state.yes == false}), 
							"No"
						)
					)
				)
			)
		);
	}
});