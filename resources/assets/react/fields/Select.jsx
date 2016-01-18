Fields.Select = React.createClass({

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false
		};
	},

	onSelectInputChange: function(event) {

		var props = this.props;

		// Is this a multiselect input?
		if(props.multiple == true) {

			var options = event.target.options,
				values = [];

			for(var i = 0; i < options.length; i++) {
				if(options[i].selected) {
					values.push(options[i].value);
				}
			}

			props.onChange(props.id, values);

		} else {
			// Check value before bubbling.
			switch(event.target.value) {
				case "__default__":
					// Spoof event target value
					this.setState({ isCustomDataOptionSelected: false });
					props.onChange(props.id, "");
					break;
				case "__custom__":
					// Set top-level state value to nothing (so it says "No data")
					this.setState({ isCustomDataOptionSelected: true });
					props.onChange(props.id, "");
					break;
				default:
					// Bubble event up to handler passed from Visit
					// (pass field ID and event)
					this.setState({ isCustomDataOptionSelected: false });
					props.onChange(props.id, event.target.value);
					break;
			}
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var props = this.props,
			state = this.state,
			options,
			optionsKeys,
			optionsDOM,
			displaySelect,
			defaultOption,
			customDataOption,
			customDataInput;

		if(props.settings.hasOwnProperty('options')) {
			options = props.settings.options;
			optionsKeys = Object.keys(options);
		} else {
			options = {};
			optionsKeys = [];
		}

		// Default option (prepended to select)
		if(props.multiple == false) {

			defaultOption = (
				<option value="__default__" disabled="disabled">Choose an option&hellip;</option>
			);

			// Custom data option (appended to select IF allowCustomData is set)
			if(isTrue(props.settings.allowCustomData)) {
				customDataOption = (
					<option value="__custom__">Enter custom data for this field &raquo;</option>
				);
			}

			// Custom data input (show if custom data option select state is true)
			if(isTrue(state.isCustomDataOptionSelected)) {
				customDataInput = (
					<input type="text" className="form-control" placeholder="Enter custom data here" onChange={this.onCustomDataInputChange} />
				);
			}
		}

		// Loop through and push options to optionsDOM
		optionsDOM = optionsKeys.map(function(optionKey, index) {
			var disabled = false,
				thisOption = props.settings.options[optionKey];
			if(thisOption.hasOwnProperty('available')) {
				disabled = (thisOption.available === "false");
			}
			return (
				<option value={options[optionKey].value} key={this.props.id + "-option-" + index} disabled={disabled}>
					{options[optionKey].value}
				</option>
			);
		}.bind(this));

		// Set size if this is a multiselect input
		var size = props.multiple ? (optionsKeys.length > 30 ? 30 : optionsKeys.length ) : 1;

		// Build the select input
		displaySelect = (
			<select
				className="form-control"
				onChange={this.onSelectInputChange}
				defaultValue={props.defaultValue !== null ? props.defaultValue : (props.multiple ? [] : "__default__")}
				multiple={props.multiple}
				size={size}>
					{defaultOption}
					{optionsDOM}
					{customDataOption}
			</select>
		);

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{displaySelect}
					{customDataInput}
				</div>
			</div>
		);
	}
});
