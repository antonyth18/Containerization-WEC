# orbis
Orbis is a sophisticated event management platform designed to simplify and elevate the experience of organizing, hosting, and participating in events at NITK.

## DB Diagram
![Orbis](https://github.com/user-attachments/assets/01384f1f-7fca-4ac9-9cc8-1f2c73f78cb2)

## Setup & Development Guidelines

1. **Install Docker Desktop**: Ensure Docker Desktop is installed on your machine to manage containerized applications.

2. **Run Docker Compose**: In the root directory, open a terminal and execute `docker-compose up -d` to start the necessary services.

3. **Backend Setup**:
   - Navigate to the backend directory in a separate terminal.
   - Add a `.env` file with the required environment variables.
   - Run `npm run dev` to start the backend server.

4. **Frontend Setup**:
   - Navigate to the frontend directory.
   - Add a `.env` file with the necessary environment variables.
   - Run `npm run dev` to start the frontend server.

## Code Practices

### Comments
- Use clear and concise comments to explain the purpose of complex code blocks. For example, `// Calculate the total price including tax`.
- Avoid redundant comments that state the obvious, such as `// Increment i by 1`.
- Use JSDoc style comments for functions and components to describe their purpose, parameters, and return values. Example:
  ```js
  /**
   * Fetches user data from the API.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} The user data.
   */
  ```

### Code Style
- Follow the Airbnb JavaScript Style Guide.
- Use 2 spaces for indentation.
- Prefer `const` and `let` over `var`.
- Use arrow functions for anonymous functions, e.g., `const add = (a, b) => a + b;`.
- Ensure consistent use of single quotes for strings, like `'Hello, World!'`.
- Place opening braces on the same line as the statement, e.g., `if (true) {`.
- Use trailing commas in multi-line objects and arrays, such as:
  ```js
  const obj = {
    name: 'Orbis',
    type: 'Platform',
  };
  ```

### Variable Style
- Use camelCase for variable and function names, e.g., `let userName`.
- Use PascalCase for React components and class names, e.g., `class UserProfile`.
- Use UPPER_SNAKE_CASE for constants, e.g., `const API_URL`.
- Choose meaningful and descriptive names for variables and functions, such as `calculateTotalPrice`.

### Commit Style
- Write clear and concise commit messages.
- Use the present tense, e.g., `Add feature` not `Added feature`.
- Capitalize the first letter of the commit message.
- Use imperative mood, e.g., `Fix bug` not `Fixed bug`.
- Include a brief description of the changes made.
- Reference relevant issue numbers in the commit message.
- Use prefixes like `fix:`, `feat:`, `frontend:`, `backend:`, `misc:` to categorize commits.

### Development Style
- Use feature branches for new features and bug fixes. For example, `feature/add-user-authentication`.
- Keep the `main` branch in a deployable state.
- Regularly pull changes from the `main` branch to keep your branch up to date.
- Write unit tests for new features and bug fixes.
- Perform code reviews and seek feedback from team members.
- Ensure code passes all tests and linting checks before merging.
