/* ========================================= */

/**
 * fields/Fields.jsx
 * @author Cameron Kelley
 */

var Fields = {
	labelColumnClasses: "col-lg-2 col-sm-4 col-xs-12",
	inputColumnClasses: "col-lg-4 col-sm-8 col-xs-12"
};

Fields.FieldLabel = React.createClass({
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				<div>
					<small className="text-muted">
						{this.props.description}
					</small>
				</div>
			);
		}
		return (
			<label htmlFor={this.props.id} className={Fields.labelColumnClasses + " form-control-label"}>
				{this.props.name}
				{description}
			</label>
		)
	}
});
