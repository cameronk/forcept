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


/* ========================================= */

var Fields = {};

Fields.Text = React.createClass({displayName: "Text",
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: "col-sm-2 form-control-label text-xs-right"}, this.props.name), 
				React.createElement("div", {className: "col-sm-10"}, 
					React.createElement("input", {
						type: "text", 
						className: "form-control", 
						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						onChange: this.onTextInputChange})
				)
			)
		);
	}
});

Fields.Select = React.createClass({displayName: "Select",
	render: function() {

		var options,
			display;
		var optionsError = false;

		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					React.createElement("option", {value: option}, option)
				);
			});
		} else {
			optionsError = true;
		}

		if(!optionsError) {
			display = (
				React.createElement("select", {className: "form-control"}, 
					options
				)
			);
		} else {
			display = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Warning:"), " no options defined for select input ", this.props.id
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: "col-sm-2 form-control-label text-xs-right"}, this.props.name), 
				React.createElement("div", {className: "col-sm-10"}, 
					display
				)
			)
		);
	}
});