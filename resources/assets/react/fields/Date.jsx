/**
 * fields/Date.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - settings:
 *   - useBroadMonthSelector: if true, show a basic month selector instead of date input
 */

Fields.Date = React.createClass({

    /*
     *
     */
	getInitialState: function() {
		return {
            value: "",
			broadMonthDetractor: null
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
            value: (props.hasOwnProperty("value") && props.value !== null) ? props.value : ""
        });
    },

    /*
     *
     */
	onBroadMonthSelectorChange: function(amount) {
		return function(evt) {
			console.log("Date: onBroadMonthSelectorChange -> %s", amount);
			this.props.onChange(this.props.id, amount);
		}.bind(this);
	},

    /*
     *
     */
	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

    /*
     *
     * @return String
     */
    getMonth: function(modifier) {

        // set up javascript date and switch month
        var now = new Date();
            now.setMonth(now.getMonth() + modifier);

		return [
			(now.getMonth()) < 9
				? "0" + (now.getMonth() + 1)
				: (now.getMonth() + 1),
			now.getDate(),
			now.getFullYear()
		].join("/");
    },

    /*
     *
     */
	render: function() {
		var dateDOM,
            props = this.props,
            state = this.state;

		if(props.hasOwnProperty('settings')
			&& props.settings.hasOwnProperty('useBroadMonthSelector')
			&& isTrue(props.settings.useBroadMonthSelector)) {

			var monthDetractors = [
				{
					name: "1 month ago",
					amount: -1
				},
				{
					name: "2 months ago",
					amount: -2
				},
				{
					name: "3 months ago",
					amount: -3
				},
				{
					name: "6 months ago",
					amount: -6
				},
				{
					name: "1 year ago",
					amount: -12
				},
			];

			dateDOM = (
				<div className="btn-group btn-group-block" data-toggle="buttons">
					{monthDetractors.map(function(detractor, index) {
                        var active = (state.value === detractor.amount);
						return (
							<label key={props.id + "-detractor-button-" + index}
                                    className={"btn btn-primary-outline" + (active ? " active" : "")}
                                    onClick={this.onBroadMonthSelectorChange(detractor.amount)}>
								<input type="radio"
									name={detractor.name + "-options"}
									autoComplete="off"
									defaultChecked={active} />
								{detractor.name}
							</label>
						);
					}.bind(this))}
				</div>
			);

		} else {
			dateDOM = (
				<input
					type="date"
					className="form-control"
					autoComplete="off"
					maxLength="255"

					id={this.props.id}
					placeholder={this.props.name + " goes here"}
					value={state.value}
					onChange={this.onDateInputChange} />
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					{dateDOM}
				</div>
			</div>
		);
	}
});
