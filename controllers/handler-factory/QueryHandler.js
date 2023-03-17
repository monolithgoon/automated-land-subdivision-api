// Define a class for handling queries
class QueryHandler {
	constructor(query, parsedQueryParams) {
		this.query = query;
		this.parsedQueryParams = parsedQueryParams;
	}

	// This method filters the query based on the parsedQueryParams parameters
	filter() {

		// create a copy of the query string
		const queryObj = { ...this.parsedQueryParams };

		// array of fields to exclude from filtering
		const excludedFields = ["page", "sort", "limit", "fields"];

		// remove the excluded fields from the query object
		excludedFields.forEach((el) => delete queryObj[el]);

		// convert query object to a string and replace any comparison operators with their MongoDB equivalent
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

		// log the resulting query string to the console
		console.log({ queryStr });

		// apply the modified query object to the query and return the modified object
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	// Method to sort results based on query parameters
	sort() {

		// Check if the 'sort' property exists in the parsedQueryParams object
		if (this.parsedQueryParams.sort) {

			// If it exists, split the comma-separated values and join them with a space to form a single string.
			const sortBy = this.parsedQueryParams.sort.split(",").join(" ");

			// Sort the query object by the 'sortBy' string
			this.query = this.query.sort(sortBy);
		} else {
			// If the 'sort' property is not in the parsedQueryParams object, sort the query object by the 'createdAt' property in descending order.
			this.query = this.query.sort("-createdAt");
		}
		// Return the updated query object
		return this;
	}

	/**
	 * Selects a subset of fields to return in the query results based on query parameters.
	 * @returns {Object} Returns the updated query object.
	 */
		limitFields() {

			// Always exclude the __v field
			// The __v field is a version key. 
			// Each time a document is updated, the value of the __v field is incremented by one. 
			this.query = this.query.select("-__v");
			
			// Check if the `fields` parameter exists in the parsedQueryParams
			if (this.parsedQueryParams.fields) {
				
				// Convert the comma-separated string of fields to a space-separated string
				// const users = await User.find().limitFields("name,email");
				// Above code is equivalent to:
				// const users = await User.find().select("name email");
				const fields = this.parsedQueryParams.fields.split(",").join(" ");

				// Select only the fields specified in the fields parameter
				this.query = this.query.select(fields);
			}
			// Return the updated query object
			return this;
		}
	
	/**
	 * Paginates the results based on query parameters.
	 * @returns {Object} Returns the updated query object.
	 */
	paginate() {
		// Get the page and limit from parsed query params or set default values
		const page = this.parsedQueryParams.page * 1 || 1;
		const limit = this.parsedQueryParams.limit * 1 || 100;

		// Calculate the number of documents to skip
		const skip = (page - 1) * limit;

		// Update the query with the skip and limit values
		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = QueryHandler;
