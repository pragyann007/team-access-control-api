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

# invite-organisation
- [x] invite member
- [x] when inviting check if thee user is in our db
- [x] if not create one invitation link
- [x] attacj the link make it jwt token type
- [x] add in token weathe ruser  registered o r not igf yes open else nope
- [x] send mail
- [ ] create invitation table
- [x] send response

# acept invite-organisation
- [ ] check the link
- [ ] do valdiations
- [ ] update the invitation table
- [ ] update the membersip table
- [ ] update the organisation table
