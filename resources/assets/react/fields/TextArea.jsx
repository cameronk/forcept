/**
 * fields/Textarea.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - onChange (function): 	handle a change to this field's data
 */

Fields.TextArea = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {
			value: null,
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
	componentWillReceiveProps: function( newProps ) {
		this.setValue(newProps);
	},

	/*
	 *
	 */
	setValue: function( props ) {
		this.setState({
			value: props.hasOwnProperty('value') ? props.value : ""
		});
	},

	/*
	 *
	 */
	onTextAreaInputChange: function(event) {
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

		console.group("  Fields.TextArea: render '%s'", this.props.name);
			console.log("Props: %O", this.props);
			console.log("State: %O", this.state);
		console.groupEnd();

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					<textarea
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={props.id}
						placeholder={props.name + " goes here"}
						value={state.value}
						onChange={this.onTextAreaInputChange} />
				</div>
			</div>
		);
	}
});
