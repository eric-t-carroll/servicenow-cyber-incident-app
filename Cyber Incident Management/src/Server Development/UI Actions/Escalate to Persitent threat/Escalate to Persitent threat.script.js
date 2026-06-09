// Set persitent threat to true
current.persistent_threat = true;

// Update work notes
current.work_notes = "Escalated to persistent threat by " + gs.getUserDisplayName() + " on " + new GlideDateTime().getDisplayValue();

// Update the record and stay
current.update();
action.setRedirectURL(current);