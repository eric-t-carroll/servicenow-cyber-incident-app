(function executeRule(current, previous /*null when async*/) {
	// Create a GlideRecord to find the Cyber Secuirity assignemnt group reference ID
	var refAssignGroup = new GlideRecord('sys_user_group');
	refAssignGroup.addQuery('name', 'Cyber Security');
	refAssignGroup.query();
	if (refAssignGroup.next()) {
		// Set assignment group to Cyber Security
		current.setValue('assignment_group', refAssignGroup.getUniqueValue());
	}
})(current, previous);