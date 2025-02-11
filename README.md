# FormKit

FormKit is a flexible and powerful React form handling component that simplifies form management in React applications. It provides an intuitive API for handling form submissions, data management, and server interactions.

## Features

- 🚀 Easy form state management
- 📡 Built-in API integration
- ⚡ Custom fetch support
- 🔄 Automatic form data handling
- 🎯 TypeScript support
- 🎨 Flexible child component rendering
- 🔒 Automatic loading state management
- 🔌 Third-party component integration

## Installation

```bash
npm install formkit-react

```

## Basic Usage

```tsx
import { FormKit } from "formkit-react";

interface LoginForm {
  email: string;
  password: string;
}

function LoginComponent() {
  return (
    <FormKit<LoginForm>
      url="/api/login"
      onSuccess={(response) => console.log("Login successful:", response)}
      onError={(error) => console.error("Login failed:", error)}
    >
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
    </FormKit>
  );
}
```

## Props

| Prop          | Type                                     | Description                                      |
| ------------- | ---------------------------------------- | ------------------------------------------------ |
| `url`         | `string`                                 | API endpoint for form submission                 |
| `action`      | `"POST" \| "PUT" \| "DELETE" \| "PATCH"` | HTTP method for the request (default: "POST")    |
| `onSubmit`    | `(data: T) => void`                      | Callback before form submission                  |
| `onSuccess`   | `(response: any) => void`                | Callback on successful submission                |
| `onError`     | `(error: any) => void`                   | Callback on submission error                     |
| `initalData`        | `T & Record<string,any>`                                | Initial form data                                |
| `customFetch` | `(data: T) => Promise<any>`              | Custom fetch function                            |
| `submitText`  | `string`                                 | Text for submit button (default: "Submit")       |
| `loadingText` | `string`                                 | Text while submitting (default: "Submitting...") |

## Form Controllers

FormKit provides a `FormKitController` component that makes it easy to integrate third-party form components. This controller handles the value management and data synchronization with the main form.

### Controller Usage

```tsx
import { FormKit } from "formkit-react";
import { FormKitController } from "formkit-react/controller";
import DatePicker from "react-third-party-datepicker";
import Select from "react-third-party-select";

interface MyFormData {
  date: Date;
  options: { value: string; label: string }[];
}

function MyForm() {
  return (
    <FormKit<MyFormData>
     url="/api/submit">
      {/* DatePicker Integration */}
      <FormKitController
        name="date"
        render={({ value, onChange }) => (
          <DatePicker selected={value} onChange={onChange} />
        )}
      />

      {/* React-Select Integration */}
      <FormKitController
        name="options"
        render={({ value, onChange }) => (
          <Select
            value={value}
            onChange={onChange}
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ]}
            isMulti
          />
        )}
      />
    </FormKit>
  );
}
```

### Controller Props

The `FormKitController` component accepts the following props:

```tsx
interface ControllerProps<T = any> {
  name: string; // Field name in the form data
  render: (props: {
    value: T;
    onChange: (value: T) => void;
  }) => React.ReactElement;
}
```

### Custom Component Integration

You can integrate any third-party component that accepts value and onChange props:

```tsx
// Example with a custom Rich Text Editor
<FormKitController
  name="content"
  render={({ value, onChange }) => (
    <RichTextEditor
      value={value}
      onChange={onChange}
      toolbar={["bold", "italic"]}
    />
  )}
/>
```

### Type Safety

The controller is fully typed and supports generic types:

```tsx
interface EditorValue {
  content: string;
  format: "html" | "markdown";
}

<FormKitController<EditorValue>
  name="editor"
  render={({ value, onChange }) => (
    <Editor
      value={value.content}
      format={value.format}
      onChange={(content) => onChange({ content, format: "html" })}
    />
  )}
/>;
```

## Advanced Usage

## Custom Fetch Handling

```tsx
interface UserForm {
  username: string;
  email: string;
}

function UserRegistration() {
  const handleCustomFetch = async (data: UserForm) => {
    // Example of custom API integration
    const response = await fetch("https://api.example.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  };

  return (
    <FormKit<UserForm>
      customFetch={handleCustomFetch}
      onSuccess={(response) => console.log("Success:", response)}
      onError={(error) => console.error("Error:", error)}

    >
      <input name="username" type="text" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Register</button>
    </FormKit>
  );
}
```

### With Initial Data

```tsx
interface ProfileForm {
  username: string;
  bio: string;
}

function ProfileEditor() {
  const initialData: ProfileForm = {
    username: "johndoe",
    bio: "Hello world!",
  };

  return (
    <FormKit<ProfileForm> url="/api/profile" action="PATCH" initalData={initialData}>
      <input name="username" type="text" />
      <textarea name="bio" />
    </FormKit>
  );
}
```

## TypeScript Support

FormKit is written in TypeScript and provides full type safety. You can specify the form data type using generics:

```tsx
interface MyFormData {
  name: string;
  email: string;
  age: number;
}

<FormKit<MyFormData>
  url="/api/submit"
  onSubmit={(data) => {
    // data is typed as MyFormData
    console.log(data.name); // TypeScript knows this exists
  }}
>
  {/* form fields */}
</FormKit>;
```

## Error Handling

FormKit provides comprehensive error handling through the `onError` prop:

```tsx
<FormKit
  url="/api/submit"
  onError={(error) => {
    if (error.message === "Network response was not ok") {
      // Handle network errors
    }
    // Handle other errors
  }}
>
  {/* form fields */}
</FormKit>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

