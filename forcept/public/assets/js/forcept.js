/**
 * Forcept.jsx
 */


var FlowEditorFieldConfiguratorOptionsInput = React.createClass({displayName: "FlowEditorFieldConfiguratorOptionsInput",
	render: function() {

	}
});

var FlowEditorFieldConfiguratorOptions = React.createClass({displayName: "FlowEditorFieldConfiguratorOptions",

	getInitialState: function() {
		return {
			fields: [],
		};
	},
	componentWillMount: function() {
		if(Array.isArray(this.props.selectOptions)) {
			this.setState({ fields: this.props.selectOptions });
		}
	},

	handleOptionTextChange: function() {

	},

	handleRemoveOption: function(index) {
		var fields = this.state.fields;
			fields.splice(index, 1);
		this.setState({ fields: fields });
	},

	handleAddOption: function() {
		var fields = this.state.fields;
			fields.push("");
		this.setState({ fields: fields });
	},

	render: function() {

		if(this.props.type == "text" || this.props.type == "date") {
			return (
				React.createElement("h5", null, "No configuration required for ", this.props.type, " inputs.")
			);
		} else if(this.props.type == "select"){

			var optionInputs;
			if(this.state.fields.length > 0) {
				optionInputs = this.state.fields.map(function(value, index) {
					return (
						React.createElement("div", {className: "field-select-option form-group row", key: index}, 
							React.createElement("div", {className: "col-sm-11"}, 
								React.createElement("input", {type: "text", placeholder: "Enter an option", className: "form-control", defaultValue: value})
							), 
							React.createElement("div", {className: "col-sm-1"}, 
								React.createElement("button", {type: "button", onClick: this.handleRemoveOption.bind(this, index), className: "btn btn-danger-outline"}, 
								  	React.createElement("span", null, "×")
								)
							)
						)
					);
				}.bind(this));
			} else {
				optionInputs = (
					React.createElement("h5", null, "No options defined. Click \"Add Another Option\" to create one.")
				);
			}

			return (
				React.createElement("div", {className: "field-select-options-contain"}, 
					optionInputs, 
					React.createElement("a", {className: "btn btn-primary-outline", onClick: this.handleAddOption}, "Add another option")
				)
			);
		} 
	}
});

 var FlowEditorFieldConfigurator = React.createClass({displayName: "FlowEditorFieldConfigurator",

 	getInitialState: function() {
 		return {
 			name: "",
 			type: "text",
 			selectOptions: [],
 		};
 	},

 	componentWillMount: function() {
 		this.setState({ 
 			name: this.props.name,
 			type: this.props.type,
 			options: this.props.options,
 		});
 	},

 	handleFieldTypeChange: function(event) {
 		this.setState({ type: event.target.value });
 	},

 	handleRemoveField: function() {
 		ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
 	},

 	render: function() {
 		return (
 			React.createElement("div", {className: "form-group row p-t"}, 
 				React.createElement("div", {className: "col-sm-4"}, 
 					React.createElement("input", {type: "text", name: "field_name", className: "form-control", placeholder: "Field name", defaultValue: this.state.name}), 
 					React.createElement("select", {className: "form-control", name: "field_type", onChange: this.handleFieldTypeChange, defaultValue: this.state.type}, 
 						React.createElement("option", {value: "text"}, "Text input"), 
 						React.createElement("option", {value: "date"}, "Date input"), 
 						React.createElement("option", {value: "select"}, "Select input with options")
 					), 
					React.createElement("button", {type: "button", className: "btn btn-danger-outline m-t", onClick: this.handleRemoveField}, 
					  	React.createElement("span", null, "× Remove this field")
					)
 				), 
	            React.createElement("div", {className: "col-sm-8"}, 
	                React.createElement(FlowEditorFieldConfiguratorOptions, {type: this.state.type, selectOptions: this.state.options})
	            )
	        )
 		);
 	}

 });