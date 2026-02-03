import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnemyDetailsPage } from './enemy-details.page';

describe('EnemyDetailsPage', () => {
  let component: EnemyDetailsPage;
  let fixture: ComponentFixture<EnemyDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemyDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
