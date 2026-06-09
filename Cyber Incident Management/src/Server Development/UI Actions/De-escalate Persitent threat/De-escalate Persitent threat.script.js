// Set persitent threat to true
current.persistent_threat = false;

// Update work notes
current.work_notes = "Persistent threat de-escalated by " + gs.getUserDisplayName() + " on " + new GlideDateTime().getDisplayValue();

// Update the record and stay
current.update();
action.setRedirectURL(current);