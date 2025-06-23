const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('API General Tests', () => {
  it('should return 404 for a non-existent route', (done) => {
    request(app)
      .get('/this-is-a-route-that-should-not-exist')
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();
      });
  });

//   it('should return a list of goals for GET /api/goals', (done) => {
//     request(app)
//       .get('/api/goals') // Đường dẫn API bạn muốn test
//       .expect(200) // Mong đợi status code 200 OK
//       .end((err, res) => {
//         if (err) return done(err);

//         // Dùng 'expect' của Chai để kiểm tra sâu hơn về dữ liệu trả về
//         expect(res.body).to.be.an('array'); // Ví dụ: mong đợi kết quả là một mảng

//         done(); // Báo hiệu test này đã hoàn thành
//       });
//   });
}); 