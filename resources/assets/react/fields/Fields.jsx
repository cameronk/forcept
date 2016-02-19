/* ========================================= */

/**
 * fields/Fields.jsx
 * @author Cameron Kelley
 */

var Fields = {
	labelColumnClasses: "col-xl-3 col-lg-4 col-md-3 col-sm-3 col-xs-12",
	inputColumnClasses: "col-xl-9 col-lg-8 col-md-9 col-sm-9 col-xs-12"
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
