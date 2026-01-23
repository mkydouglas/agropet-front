import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendaPagamentoComponent } from './venda-pagamento.component';

describe('VendaPagamentoComponent', () => {
  let component: VendaPagamentoComponent;
  let fixture: ComponentFixture<VendaPagamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendaPagamentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendaPagamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
