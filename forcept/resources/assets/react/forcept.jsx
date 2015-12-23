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


/* ========================================= */

var Fields = {};

Fields.Text = React.createClass({
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event);
	},

	render: function() {
		return (
			<div className="form-group row">
				<label htmlFor={this.props.id} className="col-xl-2 col-lg-3 col-xs-4 form-control-label text-xs-right">{this.props.name}</label>
				<div className="col-xl-10 col-lg-9 col-xs-8">
					<input 
						type="text" 
						className="form-control" 
						id={this.props.id} 
						placeholder={this.props.name + " goes here"} 
						autoComplete="off"
						onChange={this.onTextInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Select = React.createClass({

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
				this.props.onChange(this.props.id, { target: { value: "" } });
				break;
			case "__custom__":
				// Set top-level state value to nothing (so it says "No data")
				this.setState({ isCustomDataOptionSelected: true });
				this.props.onChange(this.props.id, { target: { value: "" } });
				break;
			default:
				// Bubble event up to handler passed from Visit
				// (pass field ID and event)
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, event);
				break;
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event);
	},

	render: function() {

		var options,
			displaySelect;

		// Default option (prepended to select)
		var defaultOption = (
			<option value="__default__" disabled="disabled">Choose an option&hellip;</option>
		);
		// Custom data option (appended to select IF allowCustomData is set)
		var customDataOption = (
			<option value="__custom__">Enter custom data for this field &raquo;</option>
		);

		// Custom data input 
		var customDataInput = (
			<input type="text" className="form-control" placeholder="Enter custom data here" onChange={this.onCustomDataInputChange} />
		);

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					<option value={option} key={this.props.id + "-option-" + index}>{option}</option>
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				<select className="form-control" onChange={this.onSelectInputChange} defaultValue="__default__">
					{defaultOption}
					{options}
					{isTrue(this.props.settings.allowCustomData) ? customDataOption : ""}
				</select>
			);
		} else {
			displaySelect = (
				<div className="alert alert-danger">
					<strong>Warning:</strong> no options defined for select input {this.props.id}
				</div>
			);
		}

		return (
			<div className="form-group row">
				<label htmlFor={this.props.id} className="col-xl-2 col-lg-3 col-xs-4 form-control-label text-xs-right">{this.props.name}</label>
				<div className="col-xl-10 col-lg-9 col-xs-8">
					{displaySelect}
					{isTrue(this.state.isCustomDataOptionSelected) ? customDataInput : ""}
				</div>
			</div>
		);
	}
});