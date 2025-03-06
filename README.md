#### Readme
# Rails Danbooru Clone
This project is a clone of [Danbooru](https://danbooru.donmai.us/) using Rails, I use RSS Feed to get data.
 
## View
<img src="https://s7.ezgif.com/tmp/ezgif-7ed56677cfc6ed.gif" width="50%"/>

## Requirements

- **Ruby** – Version specified in `.ruby-version`.
- **Rails** – Ensure the correct version is installed as defined in `Gemfile`.
- **Database** – PostgreSQL or SQLite depending on configuration.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rokhimin/rails-danbooru-clone.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd rails-danbooru-clone
   ```

3. **Install dependencies**:

   ```bash
   bundle install
   ```

4. **Set up the database**:

   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

## Usage

1. **Start the Rails server**:

   ```bash
   rails server
   ```

2. **Access the application** via a web browser at `http://localhost:3000`.

## Testing

To run the test suite:

```bash
rails test
```

## Contribution

1. **Fork the repository**.
2. **Create a new feature branch**:
   ```bash
   git checkout -b new-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin new-feature
   ```
5. **Open a Pull Request**.

## License

This project is licensed under the [MIT License](LICENSE).

