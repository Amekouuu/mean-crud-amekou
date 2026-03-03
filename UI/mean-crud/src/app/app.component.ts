import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

type Book = {
  id: string;
  title: string;
  desc: string;
  price: number;
  genre: string;
  author: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'booksapp';
  readonly APIUrl = "http://localhost:5038/api/books/";

  books: Book[] = [];

  shakeForm = false;
  isSubmitting = false;

  // ✅ Declare only
  bookForm!: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {

    // ✅ Initialize AFTER fb is available
    this.bookForm = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      desc: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      genre: ['', [Validators.required]],
      author: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.refreshBooks();
  }

  get f() {
    return this.bookForm.controls;
  }

  refreshBooks() {
    this.http.get<Book[]>(this.APIUrl + 'GetBooks').subscribe(data => {
      this.books = data ?? [];
    });
  }

  private triggerShake() {
    this.shakeForm = true;
    setTimeout(() => (this.shakeForm = false), 350);
  }

  addBook() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.triggerShake();
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const v = this.bookForm.getRawValue();

    const formData = new FormData();
    formData.append("title", v.title);
    formData.append("description", v.desc);
    formData.append("price", v.price);
    formData.append("genre", v.genre);
    formData.append("author", v.author);

    this.http.post(this.APIUrl + 'AddBook', formData).subscribe({
      next: () => {
        this.bookForm.reset({
          title: '',
          desc: '',
          price: '',
          genre: '',
          author: ''
        });

        this.refreshBooks();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.triggerShake();
        alert("Failed to add book. Check API/server.");
      }
    });
  }

  deleteBook(id: any) {
    this.http.delete(this.APIUrl + 'DeleteBook?id=' + id).subscribe({
      next: () => this.refreshBooks(),
      error: () => alert("Failed to delete book.")
    });
  }
}
