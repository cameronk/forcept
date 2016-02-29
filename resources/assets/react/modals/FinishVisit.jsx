/**
 * modals/FinishVisit.jsx
 * @author Cameron Kelley
 *
 * Modal that appears upon clicking "Finish visit"
 *
 * Properties
 *   - stages: array of stage objects (in order of 'order')
 *   - currentStage: current stage id
 *   - onConfirmFinishVisit: handler function for logic after moving patients
 */

Modals.FinishVisit = React.createClass({

	/*
	 * onComplete
	 */
	onComplete: function() {
		this.props.onConfirmFinishVisit(this.state.destination, this);
	},

	/*
	 * Handle destination change.
	 * @return void
	 */
	handleDestinationChange: function(destination) {
		return function(event) {
			console.log("[Visit.FinishModal] Changing destination to " + destination);
			this.setState({
				destination: destination
			});
		}.bind(this);
	},

	/*
	 * Check if a default value is going to be set
	 */
	componentWillMount: function() {
		this.resetSelectState();
	},

	resetSelectState: function() {

		var props = this.props;

		// Set default value as the first stage in the array (the next stage in order above the current one)
		if(props.hasOwnProperty('stages') && props.stages !== null && props.stages.length > 0) {
			this.setState({ destination: props.stages[0].id });
		} else {
			this.setState({ destination: "__checkout__" });
		}
	},

	/*
	 * Render the modal
	 */
	render: function() {

		var props = this.props,
			state = this.state,
			destinations,
			buttonText,
			defaultValue,
			stageNameKeyPairs = {};

		// Check if stages are defined, use them as destinations
		// NOTE: stages are in order of ORDER, not ID
		if(props.hasOwnProperty('stages') && props.stages.length > 0) {
			destinations = props.stages.map(function(stage, index) {
				stageNameKeyPairs[stage.id] = stage.name;
				return (
					<label className={"btn btn-secondary btn-block" + (stage.id == state.destination ? " active" : "")} key={"finish-modal-option" + index} onClick={this.handleDestinationChange(stage['id'])}>
						<input type="radio" name="destination" defaultChecked={stage.id == state.destination} />
						{stage.id == state.destination ? "\u2713" : ""} {stage.name}
					</label>
				);
			}.bind(this));
		}

		if(state.destination == "__checkout__") {
			buttonText = "Check-out patients";
		} else {
			buttonText = "Move patients to " + (state.destination !== null ? stageNameKeyPairs[state.destination] : stageNameKeyPairs[defaultValue]);
		}

		return (
			<div className="modal fade" id="visit-finish-modal">
			    <div className="modal-dialog modal-sm" role="document">
			        <div className="modal-content">
			            <div className="modal-header">
			                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
			                  <span aria-hidden="true">&times;</span>
			                </button>
			                <h4 className="modal-title">Move visit to...</h4>
			            </div>
			            <div className="modal-body">
			            	<div className="btn-group-vertical btn-group-lg" style={{display: "block"}} data-toggle="buttons">
			            		{destinations}
								<label className={"btn btn-secondary btn-block" + ("__checkout__" == state.destination ? " active" : "")} onClick={this.handleDestinationChange("__checkout__")}>
									<input type="radio" name="destination" defaultChecked={"__checkout__" == state.destination} />
									{"__checkout__" == state.destination ? "\u2713" : ""} Check-out
								</label>
			            	</div>
			            </div>
			            <div className="modal-footer">
			                <button type="button" className="btn btn-success" onClick={this.onComplete}>
			                	{buttonText}
			                </button>
			            </div>
			        </div>
			    </div>
			</div>
		);
	}

});
