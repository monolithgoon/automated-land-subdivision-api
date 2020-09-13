const eventSchema = new mongoose.Schema(
	{
		message: String,
	},
	{
		discriminatorKey: "kind",
	}
);

const Event = mongoose.model("Event", eventSchema);

const ClickedEvent = Event.discriminator("Polygon",
	new Schema({
		element: {
			type: String,
			required: true,
		},
	})
);

const PurchasedEvent = Event.discriminator("MultiPolygon",
	new Schema({
		product: {
			type: String,
			required: true,
		},
	})
);
