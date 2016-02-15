/**
 * fields/Select.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - multiple (boolean): 	is this a multiselect input?
 * - onChange (function): 	handle a change to this field's data
 */

Fields.Select = React.createClass({

	/*
	 * Get initial state.
	 */
	getInitialState: function() {
		return {
			value: "",

			isCustomDataOptionSelected: false,
			customDataDefaultValue: ""
		};
	},

	/*
	 * Before the field mounts...
	 */
	componentWillMount: function() {
		this.handleUpdate(this.props);
	},

	/*
	 *
	 */
	componentWillReceiveProps: function( newProps ) {
		this.handleUpdate(newProps);
	},

	/*
	 *
	 */
	handleUpdate: function( props ) {

		var options,
			optionsKeys,
			optionsValues = [];

		console.groupCollapsed("  Fields.Select: handleUpdate '%s'", props.name);
		console.log("Props: %O", props);

		this.setValue(props, function() {

			if(props.multiple !== true) {

				if(props.settings.hasOwnProperty('options')) {
					options = props.settings.options;
					optionsKeys = Object.keys(options);
				} else {
					options = {};
					optionsKeys = [];
				}

				console.log("Options keys: %O", optionsKeys);

				// Push all option values to an array.
				optionsKeys.map(function(key) {
					optionsValues.push(options[key].value);
				});

				// Check if our value is NOT a valid option value
				if(typeof props.value === "string" && optionsValues.indexOf(props.value) === -1) {
					console.log("Default value exists but isn't a valid value, enabling custom data box");
					this.setState({
						value: "__custom__",
						isCustomDataOptionSelected: true,
						customDataTextValue: props.value
					});
				} else {
					this.setState({
						isCustomDataOptionSelected: false,
						customDataTextValue: ""
					})
				}
			}

		}.bind(this));
		console.groupEnd(); // end: "Fields.Select: handleUpdate"
	},

	/*
	 *
	 */
	setValue: function(props, cb) {
		this.setState({
			value: props.value !== null
				? props.value
				: (
					props.multiple
					? []
					: "__default__"
				)
		}, cb);
	},

	/*
	 * Handle select input change Event
	 */
	onSelectInputChange: function(event) {

		var props = this.props;

		// Is this a multiselect input?
		if(props.multiple === true) {

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
					// Set top-level state value to nothing (so it says "No data")
					this.setState(this.getInitialState());
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
					this.setState(this.getInitialState());
					props.onChange(props.id, event.target.value);
					break;
			}
		}
	},

	/*
	 * Handle a change to data in the custom data text input
	 */
	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	/*
	 * Render the select field.
	 */
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

		console.groupCollapsed("  Fields.Select: render '%s'", props.name);
			console.log("State: %O", state);

		// Check if this field had options within the settings object
		if(props.settings.hasOwnProperty('options')) {
			options = props.settings.options;
			optionsKeys = Object.keys(options);
		} else {
			options = {};
			optionsKeys = [];
		}

		// Default option (prepended to select)
		if(props.multiple === false) {

			defaultOption = (
				<option value="__default__" disabled={true}>Choose an option&hellip;</option>
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
					<input type="text"
						className="form-control"
						placeholder="Enter custom data here"
						onChange={this.onCustomDataInputChange}
						defaultValue={state.customDataTextValue} />
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

		console.log("Calculated selected value: %s", state.value);

		// Build the select input
		displaySelect = (
			<select
				className="form-control"
				onChange={this.onSelectInputChange}
				value={state.value}
				multiple={props.multiple}
				size={size}>
					{defaultOption}
					{optionsDOM}
					{customDataOption}
			</select>
		);

		console.groupEnd(); // End "Fields.Select: render"

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
