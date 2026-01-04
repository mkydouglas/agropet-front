import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarCompraComponent } from './cadastrar-compra.component';

describe('CadastrarCompraComponent', () => {
  let component: CadastrarCompraComponent;
  let fixture: ComponentFixture<CadastrarCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarCompraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
