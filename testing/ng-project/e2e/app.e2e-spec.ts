import { browser } from 'protractor'
import { NgProjectPage } from './app.po'

describe('ng-project App', () => {
  let page: NgProjectPage;

  beforeEach(() => {
    page = new NgProjectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
    browser.sleep(2000)
    expect(page.getParagraphText()).toEqual('with Firebase!')
  });
});
