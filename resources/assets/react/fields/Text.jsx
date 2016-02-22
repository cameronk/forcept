/**
 * fields/Text.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - onChange (function): 	handle a change to this field's data
 */

Fields.Text = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {
			value: ""
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {
		this.setValue(this.props);
	},

	/*
	 *
	 */
	componentWillReceiveProps: function(newProps) {
		this.setValue(newProps);
	},

	/*
	 *
	 */
	setValue: function(props) {
		this.setState({
			value: (props.hasOwnProperty('value') && props.value !== null) ? props.value : ""
		});
	},

	/*
	 *
	 */
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	/*
	 *
	 */
	render: function() {

		var props = this.props,
			state = this.state;

		console.group("  Fields.Text: render '%s'", props.name);
			console.log("Props: %O", props);
			console.log("State: %O", state);
		console.groupEnd();

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					<input
						type="text"
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={props.id}
						placeholder={props.name + " goes here"}
						value={state.value}
						onChange={this.onTextInputChange} />
				</div>
			</div>
		);
	}
});
