(function runAction( /*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {

    current.work_notes = "Email reply received from " + email.from + ":\n\n" + email.body_html;
    current.update();

})(current, event, email, logger, classifier);