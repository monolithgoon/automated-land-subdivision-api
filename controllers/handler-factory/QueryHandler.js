// Define a class for handling queries
class QueryHandler {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

// This method filters the query based on the queryString parameters
filter() {

  // create a copy of the query string
  const queryObj = { ...this.queryString };

  // array of fields to exclude from filtering
  const excludedFields = ['page', 'sort', 'limit', 'fields'];

  // remove the excluded fields from the query object
  excludedFields.forEach(el => delete queryObj[el]);

  // convert query object to a string and replace any comparison operators with their MongoDB equivalent
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  // log the resulting query string to the console
  console.log({ queryStr })

  // apply the modified query object to the query and return the modified object
  this.query = this.query.find(JSON.parse(queryStr));
  return this;
}

	// Method to sort results based on query parameters
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	// Method to limit fields in each result
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			console.log({ fields })
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}

	// Method to paginate results
	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = QueryHandler;