import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KarmaPage } from './karma.page';

describe('KarmaPage', () => {
  let component: KarmaPage;
  let fixture: ComponentFixture<KarmaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KarmaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
