function onSubmit() {
	// Create variable for referring to future states in lifecycle
    var forwardStates = ['13', '14', '15', '3'];

    // Get value of containment method and state
    var myContMethod = g_form.getValue('containment_method');
    var myNewState = g_form.getValue('state');

    // Check if state is moving forward from 'Containment'
    if (g_scratchpad.originalState == '12' && forwardStates.includes(myNewState)) {

        // Check for empty Containment field
        if (myContMethod == null || myContMethod == '') {

            // Give the user a error and prevent save
            g_form.addErrorMessage(`The 'Containment Method' is mandatory when moving from 'Containment' state.`);
            return false;
        }
   }
}