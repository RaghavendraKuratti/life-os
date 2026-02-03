import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeditationSetupPage } from './meditation-setup.page';

describe('MeditationSetupPage', () => {
  let component: MeditationSetupPage;
  let fixture: ComponentFixture<MeditationSetupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeditationSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
