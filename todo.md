# auth
- [x] register controller
- [x] login controllelr
- [x] acess and refresh token rotation
- [x] configure bullmq and other stuff
- [x] maintain api docs

# toke-rotation-flow
- [x] refresh route
- [x] lok for refresh token inside cookie in request object
- [x] validate the refreshtoken by comparing its hash woth redis store
- [x] check for session activeness
- [x] generate new acces token and refresh token
- [x] send acesstoken and set cookie for refreh token
- [ ] New Task

# severe bugs in codes fix
- [x] express req,res leaked over service service just have to have access to business logics.
- [x] bcrypt js cpu bottleneck
- [x] unsafe data mutation
- [x] faulty and inconcistent db service messgae return
- [x] spelling issues
