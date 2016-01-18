Fields.YesNo = React.createClass({

	getInitialState: function() {
		return {
			yes: null,
		};
	},

	componentWillMount: function() {

		var props = this.props;

		// If data, set
		if(props.hasOwnProperty('defaultValue')
			&& props.defaultValue !== null
			&& ["yes", "no"].indexOf(props.defaultValue.toLowerCase()) !== -1) {
			this.setState({
				yes: props.defaultValue.toLowerCase() == "yes"
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

		var props = this.props,
			state = this.state;

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					<div className="btn-group btn-group-block" data-toggle="buttons">
						<label className={"btn btn-primary-outline" + (state.yes == true ? " active" : "")} onClick={this.onYesNoInputChange(true)}>
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"

								defaultChecked={state.yes == true} />
							Yes
						</label>
						<label className={"btn btn-primary-outline" + (state.yes == false ? " active" : "")} onClick={this.onYesNoInputChange(false)} >
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"

								defaultChecked={state.yes == false} />
							No
						</label>
					</div>
				</div>
			</div>
		);
	}
});
