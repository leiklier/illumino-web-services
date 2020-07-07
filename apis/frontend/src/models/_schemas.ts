// This file implements all schemas that will never be compiled
// and are only needed for subdocuments

import mongoose, { Document, Schema } from 'mongoose'

//* --------------- SEMANTIC_VERSION ---------------
export interface ISemanticVersion extends Document {
	// Properties:
	major: number
	minor: number
	patch: number
	string: string
}



export const semanticVersionSchema: Schema<ISemanticVersion> = new Schema(
	{
		major: {
			type: Number,
			required: true,
		},
		minor: {
			type: Number,
			required: true,
		},
		patch: {
			type: Number,
			required: true,
		},
	},
	{ toObject: { virtuals: true } },
)

semanticVersionSchema
	.virtual('string')
	.get(function() {
		return `v${this.major}.${this.minor}.${this.patch}`
	})
	.set(function(versionString) {
		;[this.major, this.minor, this.patch] = versionString
			.substring(1)
			.split('.')
	})