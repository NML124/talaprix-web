import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AdminDateCard } from './admin-date-card';

describe('compact collection calendar', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [AdminDateCard] });
    const fixture = TestBed.createComponent(AdminDateCard);
    fixture.componentRef.setInput('label', 'Publications depuis le');
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('value', '2026-11-26');
    fixture.detectChanges();
    return fixture;
  }

  it('opens the styled calendar and closes after choosing a date', () => {
    const fixture = render();
    const changed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    fixture.nativeElement.querySelector('.admin-date-picker__trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=dialog]')).not.toBeNull();
    fixture.nativeElement.querySelector('[aria-label="2026-11-10"]').click();
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledWith('2026-11-10');
    expect(fixture.nativeElement.querySelector('[role=dialog]')).toBeNull();
  });

  it('closes on Escape and outside click', () => {
    const fixture = render();
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
