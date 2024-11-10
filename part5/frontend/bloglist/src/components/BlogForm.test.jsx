import { render, screen, fireEvent } from "@testing-library/react";
import { vi, test, expect } from "vitest";
import BlogForm from "./BlogForm";

test("calls createBlog with correct details when the form is submitted", () => {
  const createBlogMock = vi.fn();


  render(<BlogForm createBlog={createBlogMock} />);

  const titleInput = screen.getByPlaceholderText("Enter title");
  const authorInput = screen.getByPlaceholderText("Enter author");
  const urlInput = screen.getByPlaceholderText("Enter URL");
  const createButton = screen.getByText("create");

  fireEvent.change(titleInput, { target: { value: "Test Blog Title" } });
  fireEvent.change(authorInput, { target: { value: "Test Author" } });
  fireEvent.change(urlInput, { target: { value: "http://testblog.com" } });

  fireEvent.click(createButton);

  expect(createBlogMock).toHaveBeenCalledTimes(1);

  expect(createBlogMock).toHaveBeenCalledWith({
    title: "Test Blog Title",
    author: "Test Author",
    url: "http://testblog.com",
  });
});

test("clears input fields after submission", () => {
  const createBlogMock = vi.fn();

  render(<BlogForm createBlog={createBlogMock} />);

  const titleInput = screen.getByPlaceholderText("Enter title");
  const authorInput = screen.getByPlaceholderText("Enter author");
  const urlInput = screen.getByPlaceholderText("Enter URL");
  const createButton = screen.getByText("create");

  fireEvent.change(titleInput, { target: { value: "Test Blog Title" } });
  fireEvent.change(authorInput, { target: { value: "Test Author" } });
  fireEvent.change(urlInput, { target: { value: "http://testblog.com" } });

  fireEvent.click(createButton);

  expect(titleInput.value).toBe("");
  expect(authorInput.value).toBe("");
  expect(urlInput.value).toBe("");
});
