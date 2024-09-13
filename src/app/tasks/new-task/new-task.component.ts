import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';
import {
  CanDeactivate,
  CanDeactivateFn,
  Router,
  RouterLink,
} from '@angular/router';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
})
export class NewTaskComponent {
  submitted = false;
  userId = input.required<string>();
  enteredTitle = signal('');
  enteredSummary = signal('');
  enteredDate = signal('');
  private tasksService = inject(TasksService);
  private router = inject(Router);

  onSubmit() {
    this.tasksService.addTask(
      {
        title: this.enteredTitle(),
        summary: this.enteredSummary(),
        date: this.enteredDate(),
      },
      this.userId()
    );
    this.router.navigate(['/users', this.userId(), 'tasks'], {
      replaceUrl: true,
    });
    this.submitted = true;
  }
}

export const canLeaveEditPage: CanDeactivateFn<NewTaskComponent> = (
  component
) => {
  if (component.submitted) {
    return true;
  }
  if (
    component.enteredTitle() ||
    component.enteredSummary() ||
    component.enteredDate()
  ) {
    return window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
  }
  return true;
};
