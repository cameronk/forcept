Fields.Pharmacy = React.createClass({
	getInitialState: function() {
		return {
			data: {}
		};
	},
	updateList: function() {
		$.ajax({
			type: "GET",
			url: "/data/pharmacy/drugs",
			success: function(resp) {
				if(resp.status == "success") {
					__debug(resp.data);
					this.setState({
						data: resp.data
					});
				}
			}.bind(this),
			error: function() {

			},
			complete: function() {

			}
		});
	},
	componentWillMount: function() {
		this.updateList();
	},

	onSelectedDrugsChange: function(event) {
		console.log("Selected drugs change:");
		var options = event.target.options,
			values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}
		console.log(values);
		this.props.onChange(this.props.id, values);
	},

	render: function() {
		var props = this.props,
			state = this.state,
			dataKeys = Object.keys(this.state.data);

		var selectDrugs = (
			<div className="alert alert-info">
				<strong>One moment...</strong><div>loading the latest pharmacy data</div>
			</div>
		);

		if(dataKeys.length > 0) {
			selectDrugs = (
				<select
					className="form-control forcept-field-select-drugs"
					multiple={true}
					size={10}
					onChange={this.onSelectedDrugsChange}>

					{dataKeys.map(function(drugKey, index) {
						var thisCategory = state.data[drugKey];

						if(thisCategory.hasOwnProperty('settings')
							&& thisCategory.settings.hasOwnProperty('options')
							&& thisCategory.settings.options !== null) {

							var optionKeys = Object.keys(thisCategory.settings.options);

							return (
								<optgroup key={thisCategory.name} label={thisCategory.name}>
									{optionKeys.map(function(optionKey, optionIndex) {

										var thisOption = thisCategory.settings.options[optionKey],
											disabled = thisOption.available == "false",
											displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

										if(!disabled) {
											return (
												<option value={thisOption.value} key={optionIndex}>
													{displayName}
												</option>
											);
										}

									}.bind(this))}
								</optgroup>
							);
						}
					}.bind(this))}
				</select>
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{selectDrugs}
				</div>
			</div>
		);
	}
});
