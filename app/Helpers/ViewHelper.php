<?php

/*
 * Use old data if available, otherwise model
 */
function oom($oldField, $modelField) {
	if(strlen(old($oldField)) > 0) {
		return old($oldField);
	} else return $modelField;
}