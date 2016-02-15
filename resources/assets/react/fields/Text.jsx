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
		console.groupCollapsed("  Fields.Text: mount '%s'", this.props.name);
			console.log("Props: %O", this.props);
			this.setState({
				value: this.props.value !== null ? this.props.value : null
			});
		console.groupEnd();
	},

	/*
	 *
	 */
	componentWillReceiveProps: function( newProps ) {
		console.groupCollapsed("  Fields.Text: receiveProps '%s'", newProps.name);
			console.log("Props: %O", newProps);
			this.setState({
				value: newProps.value !== null ? newProps.value : null
			});
		console.groupEnd();
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
		console.groupCollapsed("  Fields.Text: render '%s'", this.props.name);
			console.log("Props: %O", this.props);
			console.log("State: %O", this.state);
		console.groupEnd();
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input
						type="text"
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id}
						placeholder={this.props.name + " goes here"}
						value={this.state.value}
						onChange={this.onTextInputChange} />
				</div>
			</div>
		);
	}
});
