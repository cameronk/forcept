/*
 * Display the controls for the new visit page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *  - isImportBlockVisible: if the import block is visible, disable the button
 *
 *  - onFinishVisit: callback for finishing visit
 *  - onPatientAddFromScratch: callback for clicking "Create new patient record"
 *  - onShowImportBlock: callback for showing the import block within PatientsContainer
 */
Visit.NewVisitControls = React.createClass({
	handlePatientAddFromScratch: function() {
		return this.props.onPatientAddFromScratch(null);
	},
	render: function() {

		var props = this.props,
			loadingGifClasses = ("m-x loading" + (props.isLoading == false ? " invisible" : ""));

		return (
			<div className="btn-toolbar" role="toolbar">
				<div className="btn-group btn-group-lg p-b">
		        	<button type="button" className="btn btn-primary" disabled={props.isLoading} onClick={this.handlePatientAddFromScratch}>{'\u002b'} New</button>
		        	<button type="button" className="btn btn-default" disabled={props.isLoading || props.isImportBlockVisible} onClick={props.onShowImportBlock}>{'\u21af'} Import</button>
		        	</div>
	        	<div className="btn-group btn-group-lg">
	        		<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
	        		<button type="button" className="btn btn-success" disabled={props.isLoading} onClick={props.onFinishVisit}>{'\u2713'} Finish visit</button>
	        	</div>
	        </div>
	    );
	}

});


/*
 * Display the controls for the stage page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *
 *  - onFinishVisit: callback for finishing visit
 */
Visit.StageVisitControls = React.createClass({

	render: function() {

		var props = this.props,
			loadingGifClasses = ("m-x" + (props.isLoading == false ? " invisible" : ""));

		return (
			<div className="btn-toolbar" role="toolbar">
				<div className="btn-group btn-group-lg">
		        	<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
	        		<button type="button" className="btn btn-success" disabled={props.isLoading} onClick={props.onFinishVisit}>Finish visit &raquo;</button>
		        </div>
	        </div>
	    );
	}

});
