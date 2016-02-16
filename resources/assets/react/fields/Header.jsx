/**
 * fields/Header.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - onChange (function): 	handle a change to this field's data
 */

Fields.Header = React.createClass({

	/*
	 *
	 */
	render: function() {

		var description,
			props = this.props;

		if(props.hasOwnProperty('description') && description !== null) {
			description = (
				<small className="text-muted">{props.description}</small>
			);
		}
		
		return (
			<div className="form-group row">
				<h3 className="forcept-fieldset-header">{props.name} {description}</h3>
				<hr/>
			</div>
		);

	}
});
