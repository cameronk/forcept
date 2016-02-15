/**
 * fields/YesNo.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - onChange (function): 	handle a change to this field's data
 */
 Fields.YesNo = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {
			yes: null,
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
	setValue: function(props) {
		if(!props.hasOwnProperty('value')
			|| props.value === null
			|| ["yes", "no"].indexOf(props.value.toLowerCase()) === -1) {
			this.setState({
				yes: null,
			});
		} else {
			this.setState({
				yes: props.value.toLowerCase() === "yes"
			});
		}
	},

	/*
	 *
	 */
	onYesNoInputChange: function(status) {
		return function(evt) {
			console.log("Caught yes/no input change -> " + status);

			this.setState({
				yes: status
			});

			this.props.onChange(this.props.id, status ? "Yes" : "No");

		}.bind(this);
	},

	/*
	 *
	 */
	render: function() {

		var props = this.props,
			state = this.state;

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					<div className="btn-group btn-group-block" data-toggle="buttons">
						<label className={"btn btn-primary-outline" + (state.yes === true ? " active" : "")} onClick={this.onYesNoInputChange(true)}>
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"
								checked={state.yes === true} />
							Yes
						</label>
						<label className={"btn btn-primary-outline" + (state.yes === false ? " active" : "")} onClick={this.onYesNoInputChange(false)} >
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"
								checked={state.yes === false} />
							No
						</label>
					</div>
				</div>
			</div>
		);
	}
});
